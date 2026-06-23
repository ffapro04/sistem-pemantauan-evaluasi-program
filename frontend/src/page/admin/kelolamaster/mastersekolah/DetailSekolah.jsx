import { MasterDetailPage } from "../../../../components/masterCrud";
import { sekolahConfig } from "../../../../config/masterCrud/sekolah.config";

export default function DetailSekolah() {
  return <MasterDetailPage config={sekolahConfig} />;
}
