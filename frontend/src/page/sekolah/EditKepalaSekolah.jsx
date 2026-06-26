import { MasterFormPage } from "../../components/masterCrud";
import { kepalaSekolahOperatorConfig } from "../../config/masterCrud/kepalaSekolahOperator.config";

export default function EditKepalaSekolah() {
  return <MasterFormPage config={kepalaSekolahOperatorConfig} mode="edit" />;
}
