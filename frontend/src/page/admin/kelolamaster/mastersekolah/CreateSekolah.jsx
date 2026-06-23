import { MasterFormPage } from "../../../../components/masterCrud";
import { sekolahConfig } from "../../../../config/masterCrud/sekolah.config";

export default function CreateSekolah() {
  return <MasterFormPage config={sekolahConfig} mode="create" />;
}
