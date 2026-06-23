import { DashboardVendorPage } from "../../components/vendor";

function DashboardVendor() {
    return (
        <DashboardVendorPage
            title="Dashboard Vendor"
            listPath="/vendor/program"
            detailPathPrefix="/vendor/program/detail"
        />
    );
}

export default DashboardVendor;
