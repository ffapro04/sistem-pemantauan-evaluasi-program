import ReadProgramPage from "../../../components/program/ReadProgramPage";

function ReadProgramnonAkademik() {
<<<<<<< HEAD
=======
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterWilayah, setFilterWilayah] = useState("Semua");
  const [programs, setPrograms] = useState([]);
  const [sekolahs, setSekolahs] = useState([]);
const [selectedSchool, setSelectedSchool] = useState(null); 
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const limit = 12;
  const start = (page - 1) * limit;
  const end = start + limit;

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Aktif" ? "Draft" : "Aktif";

      const res = await fetch(`http://localhost:3000/program/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_program: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status");

      toast.success(`Status program berhasil diubah menjadi ${newStatus}`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah status program");
    }
  };

  const openDrawer = (school) => {
  setSelectedSchool(school);
  setIsDrawerOpen(true);
};

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [resProgram, resSekolah] = await Promise.all([
        fetch("http://localhost:3000/program?kategori=NON_AKADEMIK", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/sekolah", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!resProgram.ok || !resSekolah.ok) throw new Error("Gagal mengambil data");

      const dataProgram = await resProgram.json();
      const dataSekolah = await resSekolah.json();
      
      setPrograms(Array.isArray(dataProgram) ? dataProgram : []);
      setSekolahs(Array.isArray(dataSekolah) ? dataSekolah : []);
      
      // Sinkronisasi data selectedSchool jika drawer sedang terbuka
      if (selectedSchool) {
        const updatedSchool = (Array.isArray(dataSekolah) ? dataSekolah : []).find(s => s.id_sekolah === selectedSchool.id_sekolah);
        if (updatedSchool) {
          const matchedPrograms = (Array.isArray(dataProgram) ? dataProgram : []).filter(p => p.sekolah === updatedSchool.nama_sekolah);
          setSelectedSchool({
            ...updatedSchool,
            program_list: matchedPrograms,
            total_program: matchedPrograms.length
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data master.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Master Sekolah
  const filteredSekolahs = sekolahs
    .filter((s) => {
      if (filterWilayah === "Semua") return true;
      return s.wilayah?.nama_wilayah === filterWilayah;
    })
    .filter((s) =>
      [s.nama_sekolah, s.npsn]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  // Mapping Program ke Sekolah
  const schoolsArray = filteredSekolahs.map(sekolah => {
    const matchedPrograms = programs.filter(p => {
      // Lebih aman mencocokkan id_sekolah jika ada, atau fallback ke nama sekolah (case-insensitive & trim)
      if (p.id_sekolah && sekolah.id_sekolah) {
        return String(p.id_sekolah) === String(sekolah.id_sekolah);
      }
      return p.sekolah?.trim().toLowerCase() === sekolah.nama_sekolah?.trim().toLowerCase();
    });
    
    return {
      ...sekolah,
      program_list: matchedPrograms,
      total_program: matchedPrograms.length || 0,
      aktif_count: matchedPrograms.filter(p => p.status_program === 'Aktif').length || 0,
      draft_count: matchedPrograms.filter(p => p.status_program === 'Draft').length || 0,
    };
  });

  const currentData = schoolsArray.slice(start, end);
  const totalPages = Math.ceil(schoolsArray.length / limit) || 1;

  // Dapatkan list wilayah unik dari data sekolah
  const uniqueWilayahs = [...new Set(sekolahs.map(s => s.wilayah?.nama_wilayah).filter(Boolean))];
  const filterOptions = [
    { label: "Semua Wilayah", value: "Semua" },
    ...uniqueWilayahs.map(w => ({ label: w.split("/").pop().toUpperCase(), value: w }))
  ];

>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
  return (
    <ReadProgramPage
      kategori="NON_AKADEMIK"
      title="Program Non-Akademik"
      titleHighlight="Non-Akademik"
      createPath="/ho/program/non-akademik/create"
      listPathPrefix="/ho/program/non-akademik/list"
      detailButtonText="Daftar Program Non-Akademik"
    />
  );
}

export default ReadProgramnonAkademik;
