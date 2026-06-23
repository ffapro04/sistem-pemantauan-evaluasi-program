import { MasterReadPage } from "../../../../components/masterCrud";
import { sekolahConfig } from "../../../../config/masterCrud/sekolah.config";

export default function ReadSekolah() {
  return <MasterReadPage config={sekolahConfig} />;
}
