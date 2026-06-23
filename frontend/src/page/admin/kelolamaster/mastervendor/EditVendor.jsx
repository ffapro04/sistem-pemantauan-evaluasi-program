import { MasterFormPage } from "../../../../components/masterCrud";
import { vendorConfig } from "../../../../config/masterCrud/vendor.config";

export default function EditVendor() {
  return <MasterFormPage config={vendorConfig} mode="edit" />;
}
