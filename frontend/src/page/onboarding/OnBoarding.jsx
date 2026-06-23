/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Footer, Navbar } from "../../components/common";

import {
  CoreValuesSection,
  LoadingScreen,
  OnboardingHero,
  SchoolDetailModal,
  SchoolMapPanel,
} from "../../components/onboarding";

import picturependidikan from "../../assets/img/pichture_pendidikan 1.png";

const API_BASE_URL = "http://localhost:3000";
const INDONESIA_CENTER = [-2.5, 118];
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 11;
const ITEMS_PER_PAGE = 6;

function OnBoarding() {
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [selectedJenis, setSelectedJenis] = useState("all");

  const [mapCenter, setMapCenter] = useState(INDONESIA_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchoolModal, setSelectedSchoolModal] = useState(null);

  const filteredSekolah = useMemo(() => {
    return sekolahList.filter((sekolah) => {
      const wilayahInfo = wilayahList.find(
        (wilayah) => wilayah.id_wilayah === sekolah.id_wilayah,
      );

      const matchWilayah = selectedWilayah
        ? sekolah.id_wilayah === selectedWilayah.id_wilayah
        : true;

      const matchJenis =
        selectedJenis === "all"
          ? true
          : wilayahInfo?.jenis_wilayah === selectedJenis;

      return matchWilayah && matchJenis;
    });
  }, [sekolahList, selectedWilayah, selectedJenis, wilayahList]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSekolah.length / ITEMS_PER_PAGE),
  );

  const currentSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSekolah.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSekolah, currentPage]);

  const schoolStats = useMemo(() => {
    const totalGuru = sekolahList.reduce(
      (total, item) => total + Number(item.jumlah_guru || 0),
      0,
    );

    const totalSiswa = sekolahList.reduce(
      (total, item) => total + Number(item.jumlah_siswa || 0),
      0,
    );

    return {
      totalWilayah: wilayahList.length,
      totalSekolah: sekolahList.length,
      totalGuru,
      totalSiswa,
      filteredSekolah: filteredSekolah.length,
    };
  }, [wilayahList, sekolahList, filteredSekolah]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const [wilayahResponse, sekolahResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/wilayah`),
          axios.get(`${API_BASE_URL}/sekolah`),
        ]);

        const activeWilayah = wilayahResponse.data.filter(
          (wilayah) => wilayah.status === true || wilayah.status === 1,
        );

        setWilayahList(activeWilayah);
        setSekolahList(sekolahResponse.data);
      } catch (error) {
        console.error("Gagal mengambil data onboarding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWilayah, selectedJenis]);

  const resetFilter = () => {
    setSelectedWilayah(null);
    setSelectedJenis("all");
    setMapCenter(INDONESIA_CENTER);
    setZoom(DEFAULT_ZOOM);
    setCurrentPage(1);
  };

  const selectWilayah = (wilayah, zoomLevel = SELECTED_ZOOM) => {
    const lat = Number.parseFloat(wilayah.latitude);
    const lng = Number.parseFloat(wilayah.longitude);

    setSelectedWilayah(wilayah);

    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
      setMapCenter([lat, lng]);
      setZoom(zoomLevel);
    }

    setCurrentPage(1);
  };

  const openSchoolModal = (school) => {
    setSelectedSchoolModal(school);
    setIsModalOpen(true);
  };

  const closeSchoolModal = () => {
    setSelectedSchoolModal(null);
    setIsModalOpen(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#F7FAFC] font-sans text-slate-800 selection:bg-[#0AC4E0]/20">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[#0AC4E0]/10 blur-[120px]" />
        <div className="absolute -left-40 top-[520px] h-[420px] w-[420px] rounded-full bg-cyan-200/30 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar isDashboard />

        <OnboardingHero
          image={picturependidikan}
          stats={schoolStats}
          selectedWilayah={selectedWilayah}
        />

        <SchoolMapPanel
          wilayahList={wilayahList}
          selectedWilayah={selectedWilayah}
          selectedJenis={selectedJenis}
          mapCenter={mapCenter}
          zoom={zoom}
          schools={currentSchools}
          totalSchools={filteredSekolah.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onSelectWilayah={selectWilayah}
          onResetFilter={resetFilter}
          onChangeJenis={setSelectedJenis}
          onOpenSchool={openSchoolModal}
          onPreviousPage={() =>
            setCurrentPage((page) => Math.max(1, page - 1))
          }
          onNextPage={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        />

        <CoreValuesSection />

        <Footer />

        <SchoolDetailModal
          isOpen={isModalOpen}
          onClose={closeSchoolModal}
          initialSchool={selectedSchoolModal}
          allSchools={sekolahList}
          wilayahList={wilayahList}
        />
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default OnBoarding;
=======
export default Onboarding;
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
