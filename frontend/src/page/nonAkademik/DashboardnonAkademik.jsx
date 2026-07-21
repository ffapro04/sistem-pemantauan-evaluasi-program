import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { DashboardBase } from "../../components/Dashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function getHoCategoryFromToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const jenis = String(decoded?.jenis || "").toLowerCase();

    if (Number(decoded?.id_role) !== 3) return null;

    return jenis.includes("non") ? "NON_AKADEMIK" : "AKADEMIK";
  } catch {
    return null;
  }
}

function DashboardNonAkademik() {
  const navigate = useNavigate();

  useEffect(() => {
    const category = getHoCategoryFromToken();

    if (category === "AKADEMIK") {
      navigate("/ho/dashboard/akademik", { replace: true });
    }
  }, [navigate]);

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
      subtitle="Pantau sekolah, program, dan assessment bidang Seni Budaya serta Kecakapan Hidup untuk jenjang SD, SMP, dan SMK."
      categoryLabel="Seni Budaya & Kecakapan Hidup"
      categoryFilter="NON_AKADEMIK"
      allowedJenjang={[]}
      scopeLabel="Cakupan SD, SMP & SMK"
      primaryEndpoint={`${API_BASE_URL}/sekolah`}
      programEndpoint={`${API_BASE_URL}/program`}
      assessmentEndpoint={`${API_BASE_URL}/assessment?jenis=non-akademik`}
      primaryDataKey="Sekolah"
      mapTitle="Sebaran Sekolah Seni Budaya & Kecakapan Hidup"
      mapSubtitle="Peta sekolah yang terkait program atau assessment Seni Budaya dan Kecakapan Hidup"
      mapCenter={[-2.5489, 118.0149]}
      mapZoom={5}
      detailTitle="Detail Monitoring Seni Budaya & Kecakapan Hidup"
      onProgramClick={handleProgramClick}
      onAssessmentClick={handleAssessmentClick}
    />
  );
}

export default DashboardNonAkademik;

