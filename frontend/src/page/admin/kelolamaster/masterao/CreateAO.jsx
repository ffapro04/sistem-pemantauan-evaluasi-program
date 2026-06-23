import { MasterFormPage } from "../../../../components/masterCrud";
import { aoConfig } from "../../../../config/masterCrud/ao.config";

export default function CreateAO() {
  return <MasterFormPage config={aoConfig} mode="create" />;
}
