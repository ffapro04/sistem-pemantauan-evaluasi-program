import { useNavigate } from "react-router-dom";
import { DashboardBase } from "../../components/Dashboard";

function DashboardNonAkademik() {
  const navigate = useNavigate();

  const handleProgramClick = (program) => {
    const id = program?.id_program || program?.id;

    if (!id) return;

    navigate(`/ho/program/non-akademik/detail/${id}`);
  };

  const handleAssessmentClick = (assessment) => {
    const id = assessment?.id_assessment || assessment?.id;

    if (!id) return;

    navigate(`/ho/assessment/non-akademik/detail/${id}`);
  };

  return (
    <DashboardBase
      title="Dashboard Head Office"
      titleHighlight="Non-Akademik"
      subtitle="Pantau sebaran sekolah, program non-akademik, dan pengisian assessment secara terpusat."
      categoryLabel="Non-Akademik"
      categoryFilter="NON_AKADEMIK"
      primaryEndpoint="http://localhost:3000/sekolah"
      programEndpoint="http://localhost:3000/program?kategori=NON_AKADEMIK"
      assessmentEndpoint="http://localhost:3000/assessment?jenis=non-akademik"
      bestRenggoEndpoint="http://localhost:3000/assessment/best-renggo?jenis=non-akademik"
      primaryDataKey="Sekolah"
      mapTitle="Sebaran Sekolah Non-Akademik"
      mapSubtitle="Peta sekolah dan aktivitas program non-akademik"
      mapCenter={[-2.5489, 118.0149]}
      mapZoom={5}
      detailTitle="Detail Monitoring Non-Akademik"
      onProgramClick={handleProgramClick}
      onAssessmentClick={handleAssessmentClick}
    />
  );
}

export default DashboardNonAkademik;