import { DashboardBase } from "../../components/Dashboard";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function DashboardPengurus() {
    return (
        <DashboardBase
            title="Dashboard"
            titleHighlight="Pengurus"
            subtitle="Ringkasan eksekutif seluruh program pada semua area, seluruh jenjang, dan 4 pilar dalam cakupan Pengurus."
            categoryLabel="4 Pilar Program"
            categoryFilter=""
            allowedJenjang={[]}
            scopeLabel="Semua Area"
            primaryEndpoint={`${API_BASE_URL}/sekolah`}
            programEndpoint={`${API_BASE_URL}/program`}
            primaryDataKey="Sekolah"
            showAssessment={false}
            showMonitoringList={false}
            showExecutiveSummary
        />
    );
}

export default DashboardPengurus;