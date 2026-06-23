import { MasterReadPage } from "../../../../components/masterCrud";
import { pengurusConfig } from "../../../../config/masterCrud/pengurus.config";

export default function ReadPengurus() {
  return <MasterReadPage config={pengurusConfig} />;
}
