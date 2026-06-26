import { MasterFormPage } from "../../components/masterCrud";
import { kepalaSekolahOperatorConfig } from "../../config/masterCrud/kepalaSekolahOperator.config";

export default function CreateKepalaSekolah() {
  return <MasterFormPage config={kepalaSekolahOperatorConfig} mode="create" />;
}
