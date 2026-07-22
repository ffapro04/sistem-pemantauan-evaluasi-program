import { Component } from "react";
import { VendorProgramDetailPage } from "../../components/vendor";
import { PageState } from "../../components/common";

class VendorDetailErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Detail program vendor gagal dirender:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <PageState
                    tone="error"
                    eyebrow="Detail Program Vendor"
                    title="Halaman gagal dimuat"
                    description="Data program belum bisa ditampilkan. Silakan refresh atau kembali ke daftar program."
                    primaryAction={{
                        label: "Refresh",
                        onClick: () => window.location.reload(),
                    }}
                    secondaryAction={{
                        label: "Kembali",
                        onClick: () => {
                            window.location.href = "/vendor/program";
                        },
                    }}
                />
            );
        }

        return this.props.children;
    }
}

function DetailProgramVendor() {
    return (
        <VendorDetailErrorBoundary>
            <VendorProgramDetailPage
                backPath="/vendor/program"
                listPath="/vendor/program"
            />
        </VendorDetailErrorBoundary>
    );
}

export default DetailProgramVendor;
