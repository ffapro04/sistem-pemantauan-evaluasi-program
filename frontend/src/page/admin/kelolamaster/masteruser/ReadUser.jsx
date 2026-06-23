import { MasterReadPage } from "../../../../components/masterCrud";
import { userConfig } from "../../../../config/masterCrud/user.config";

export default function ReadUser() {
  return <MasterReadPage config={userConfig} />;
}
