import { MasterDetailPage } from "../../../../components/masterCrud";
import { vendorConfig } from "../../../../config/masterCrud/vendor.config";

export default function DetailVendor() {
  return <MasterDetailPage config={vendorConfig} />;
}
