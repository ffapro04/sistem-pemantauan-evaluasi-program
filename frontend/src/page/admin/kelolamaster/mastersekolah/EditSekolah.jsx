import { MasterFormPage } from "../../../../components/masterCrud";
import { sekolahConfig } from "../../../../config/masterCrud/sekolah.config";

export default function EditSekolah() {
  return <MasterFormPage config={sekolahConfig} mode="edit" />;
}
