import { DashboardBase } from "../../components/Dashboard";

import { API_BASE_URL } from "../../config/apiBase.js";

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