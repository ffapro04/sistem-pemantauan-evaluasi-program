import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { DashboardBase } from "../../components/Dashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function getHoPayloadFromToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

function getHoCategoryFromToken() {
  const decoded = getHoPayloadFromToken();

  if (!decoded || Number(decoded?.id_role) !== 3) return null;

  const jenis = String(decoded?.jenis || "").toLowerCase();

  return jenis.includes("non") ? "NON_AKADEMIK" : "AKADEMIK";
}

function getAkademikScopeFromToken() {
  const decoded = getHoPayloadFromToken();

  const raw = String(
    decoded?.sub_jenis ||
    decoded?.subJenis ||
    decoded?.bidang ||
    decoded?.jabatan ||
    "",
  ).toLowerCase();

  if (raw.includes("smk")) {
    return {
      allowedJenjang: ["SMK"],
      scopeLabel: "Cakupan SMK",
      titleHighlight: "Akademik SMK",
      subtitle:
        "Pantau sekolah, program, dan assessment bidang Akademik serta Karakter khusus jenjang SMK.",
      mapTitle: "Sebaran Sekolah Akademik & Karakter SMK",
      mapSubtitle:
        "Peta sekolah yang terkait program atau assessment Akademik dan Karakter jenjang SMK",
      detailTitle: "Detail Monitoring Akademik & Karakter SMK",
    };
  }

  return {
    allowedJenjang: ["SD", "SMP"],
    scopeLabel: "Cakupan SD & SMP",
    titleHighlight: "Akademik SD/SMP",
    subtitle:
      "Pantau sekolah, program, dan assessment bidang Akademik serta Karakter khusus jenjang SD dan SMP.",
    mapTitle: "Sebaran Sekolah Akademik & Karakter SD/SMP",
    mapSubtitle:
      "Peta sekolah yang terkait program atau assessment Akademik dan Karakter jenjang SD dan SMP",
    detailTitle: "Detail Monitoring Akademik & Karakter SD/SMP",
  };
}

function DashboardAkademik() {
  const navigate = useNavigate();

  const scope = useMemo(() => getAkademikScopeFromToken(), []);

  useEffect(() => {
    const category = getHoCategoryFromToken();

    if (category === "NON_AKADEMIK") {
      navigate("/ho/dashboard/non-akademik", { replace: true });
    }
  }, [navigate]);

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
      titleHighlight={scope.titleHighlight}
      subtitle={scope.subtitle}
      categoryLabel="Akademik & Karakter"
      categoryFilter="AKADEMIK"
      allowedJenjang={scope.allowedJenjang}
      scopeLabel={scope.scopeLabel}
      primaryEndpoint={`${API_BASE_URL}/sekolah`}
      programEndpoint={`${API_BASE_URL}/program`}
      assessmentEndpoint={`${API_BASE_URL}/assessment?jenis=akademik`}
      primaryDataKey="Sekolah"
      mapTitle={scope.mapTitle}
      mapSubtitle={scope.mapSubtitle}
      mapCenter={[-2.5489, 118.0149]}
      mapZoom={5}
      detailTitle={scope.detailTitle}
      onProgramClick={handleProgramClick}
      onAssessmentClick={handleAssessmentClick}
    />
  );
}

export default DashboardAkademik;

