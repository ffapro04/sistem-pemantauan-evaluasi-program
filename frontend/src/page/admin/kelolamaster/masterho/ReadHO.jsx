import { MasterReadPage } from "../../../../components/masterCrud";
import { hoConfig } from "../../../../config/masterCrud/ho.config";

export default function ReadHO() {
  return <MasterReadPage config={hoConfig} />;
}
