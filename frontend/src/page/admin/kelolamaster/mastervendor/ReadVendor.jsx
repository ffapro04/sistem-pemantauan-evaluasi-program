import { MasterReadPage } from "../../../../components/masterCrud";
import { vendorConfig } from "../../../../config/masterCrud/vendor.config";

export default function ReadVendor() {
  return <MasterReadPage config={vendorConfig} />;
}
