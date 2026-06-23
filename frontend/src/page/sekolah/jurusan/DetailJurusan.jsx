import { MasterDetailPage } from "../../../components/masterCrud";
import { jurusanConfig } from "../../../config/masterCrud/jurusan.config";

export default function DetailJurusan() {
    return <MasterDetailPage config={jurusanConfig} />;
}
