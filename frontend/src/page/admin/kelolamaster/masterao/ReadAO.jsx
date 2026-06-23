import { MasterReadPage } from "../../../../components/masterCrud";
import { aoConfig } from "../../../../config/masterCrud/ao.config";

export default function ReadAO() {
  return <MasterReadPage config={aoConfig} />;
}
