import { MasterFormPage } from "../../../../components/masterCrud";
import { aoConfig } from "../../../../config/masterCrud/ao.config";

export default function EditAO() {
  return <MasterFormPage config={aoConfig} mode="edit" />;
}
