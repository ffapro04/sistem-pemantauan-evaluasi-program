import React from "react";
import MasterDetailPage from "../../components/masterCrud/MasterDetailPage";
import { kelasConfig } from "../../config/masterCrud/kelas.config";

export default function DetailKelas() {
    return <MasterDetailPage config={kelasConfig} />;
}
