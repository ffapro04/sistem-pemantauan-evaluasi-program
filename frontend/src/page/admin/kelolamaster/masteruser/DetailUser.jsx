import { MasterDetailPage } from "../../../../components/masterCrud";
import { userConfig } from "../../../../config/masterCrud/user.config";

export default function DetailUser() {
  return <MasterDetailPage config={userConfig} />;
}
