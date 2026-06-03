import { useNavigate } from "react-router-dom";
import { DashboardBase } from "../../components/Dashboard";

function DashboardAkademik() {
  const navigate = useNavigate();

  const handleProgramClick = (program) => {
    const id = program?.id_program || program?.id;

    if (!id) return;

    navigate(`/ho/program/akademik/detail/${id}`);
  };

  const handleAssessmentClick = (assessment) => {
    const id = assessment?.id_assessment || assessment?.id;

    if (!id) return;

    navigate(`/ho/assessment/akademik/detail/${id}`);
  };

  return (
    <DashboardBase
      title="Dashboard Head Office"
      titleHighlight="Akademik"
      subtitle="Pantau sebaran sekolah, program akademik, dan pengisian assessment secara terpusat."
      categoryLabel="Akademik"
      categoryFilter="AKADEMIK"
      primaryEndpoint="http://localhost:3000/sekolah"
      programEndpoint="http://localhost:3000/program?kategori=AKADEMIK"
      assessmentEndpoint="http://localhost:3000/assessment?jenis=akademik"
      bestRenggoEndpoint="http://localhost:3000/assessment/best-renggo?jenis=akademik"
      primaryDataKey="Sekolah"
      mapTitle="Sebaran Sekolah Akademik"
      mapSubtitle="Peta sekolah dan aktivitas program akademik"
      mapCenter={[-2.5489, 118.0149]}
      mapZoom={5}
      detailTitle="Detail Monitoring Akademik"
      onProgramClick={handleProgramClick}
      onAssessmentClick={handleAssessmentClick}
    />
  );
}

export default DashboardAkademik;