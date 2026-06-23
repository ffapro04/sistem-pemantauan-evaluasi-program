import { MasterFormPage } from "../../../components/masterCrud";
import { jurusanConfig } from "../../../config/masterCrud/jurusan.config";

export default function EditJurusan() {
    return <MasterFormPage config={jurusanConfig} mode="edit" />;
}
