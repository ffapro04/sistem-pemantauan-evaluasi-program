import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SchedulingCalendarBase } from "../../../components/Dashboard";

function normalizeArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getScheduleDate(program, fase, kegiatan) {
  return (
    kegiatan?.tanggal_kegiatan ||
    kegiatan?.tanggal_mulai ||
    fase?.tanggal_mulai ||
    program?.tanggal_mulai ||
    program?.created_at ||
    new Date()
  );
}

function mapProgramsToSchedules(programs) {
  return programs.flatMap((program) => {
    const fases = Array.isArray(program?.fases) ? program.fases : [];

    if (fases.length === 0) {
      return [
        {
          id: `program-${program.id_program}`,
          programId: program.id_program,
          title: program.nama_program || "Program Non-Akademik",
          date: getScheduleDate(program),
          startTime: "08:00",
          endTime: "09:00",
          phase: "Program",
          description:
            program.deskripsi || "Program belum memiliki rincian kegiatan.",
          programName: program.nama_program,
        },
      ];
    }

    return fases.flatMap((fase) => {
      const kegiatans = Array.isArray(fase?.kegiatans) ? fase.kegiatans : [];

      if (kegiatans.length === 0) {
        return [
          {
            id: `fase-${fase.id_fase}`,
            programId: program.id_program,
            title: fase.nama_fase || "Fase Program",
            date: getScheduleDate(program, fase),
            startTime: "08:00",
            endTime: "09:00",
            phase: fase.nama_fase || "Fase",
            description: fase.deskripsi || program.deskripsi || "",
            programName: program.nama_program,
          },
        ];
      }

      return kegiatans.map((kegiatan, index) => ({
        id: `kegiatan-${kegiatan.id_kegiatans || index}`,
        programId: program.id_program,
        kegiatanId: kegiatan.id_kegiatans,
        title: kegiatan.nama_kegiatans || "Kegiatan Program",
        date: getScheduleDate(program, fase, kegiatan),
        startTime: kegiatan.jam_mulai || kegiatan.start_time || "08:00",
        endTime: kegiatan.jam_selesai || kegiatan.end_time || "09:00",
        phase: fase.nama_fase || `Fase ${fase.urutan || ""}`,
        description: kegiatan.deskripsi || fase.deskripsi || "",
        programName: program.nama_program,
      }));
    });
  });
}

function CalendarOfEventnonAkademik() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/program?kategori=NON_AKADEMIK",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Gagal mengambil program non-akademik");
      }

      setPrograms(normalizeArray(data));
    } catch (error) {
      console.error("Gagal mengambil calendar non-akademik:", error);
      toast.error(error.message || "Gagal mengambil calendar event non-akademik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const schedules = useMemo(() => mapProgramsToSchedules(programs), [programs]);

  return (
    <SchedulingCalendarBase
      title="Calendar of Event"
      titleHighlight="Non-Akademik"
      subtitle="Lihat jadwal fase dan kegiatan program non-akademik berdasarkan tanggal pelaksanaan."
      loading={loading}
      schedules={schedules}
      onScheduleClick={(schedule) =>
        navigate(`/ho/program/non-akademik/detail/${schedule.programId}`)
      }
    />
  );
}

export default CalendarOfEventnonAkademik;