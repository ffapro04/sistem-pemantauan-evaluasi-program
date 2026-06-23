import { MasterFormPage } from "../../../../components/masterCrud";
import { vendorConfig } from "../../../../config/masterCrud/vendor.config";

export default function CreateVendor() {
  return <MasterFormPage config={vendorConfig} mode="create" />;
}
