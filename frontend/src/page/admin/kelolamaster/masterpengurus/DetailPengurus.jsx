import { MasterDetailPage } from "../../../../components/masterCrud";
import { pengurusConfig } from "../../../../config/masterCrud/pengurus.config";

export default function DetailPengurus() {
  return <MasterDetailPage config={pengurusConfig} />;
}
