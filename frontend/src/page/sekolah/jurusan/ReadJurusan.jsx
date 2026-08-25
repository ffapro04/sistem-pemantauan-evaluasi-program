import { jwtDecode } from "jwt-decode";
import { MasterReadPage } from "../../../components/masterCrud";
import { jurusanConfig } from "../../../config/masterCrud/jurusan.config";
import { getAuthToken } from "../../../utils/authSession";

const getCurrentUser = () => {
    try {
        const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

        if (userFromStorage && Object.keys(userFromStorage).length > 0) {
            return userFromStorage;
        }

        const token = getAuthToken();
        if (!token) return {};

        return jwtDecode(token);
    } catch {
        return {};
    }
};

const isOperatorSekolah = () => {
    const user = getCurrentUser();

    const idRole = Number(user?.id_role || user?.role_id || 0);
    const role = String(user?.role || user?.nama_role || "").toLowerCase();
    const jabatan = String(user?.jabatan || "").toLowerCase();

    return (
        idRole === 5 ||
        idRole === 9 ||
        role.includes("operator") ||
        jabatan.includes("operator sekolah") ||
        jabatan.includes("operator")
    );
};

const getReadOnlyJurusanConfig = () => {
    return {
        ...jurusanConfig,
        subtitle: "Daftar jurusan pada sekolah Anda",
        routes: {
            read: "/sekolah/daftar-jurusan",
            detail: jurusanConfig.routes.detail,
        },
        api: {
            list: jurusanConfig.api.list,
            detail: jurusanConfig.api.detail,
        },
        status: null,
        deleteConfirmation: null,
    };
};

export default function ReadJurusan() {
    const config = isOperatorSekolah()
        ? jurusanConfig
        : getReadOnlyJurusanConfig();

    return <MasterReadPage config={config} />;
}
