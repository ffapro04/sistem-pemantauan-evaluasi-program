import { MasterFormPage } from "../../../components/masterCrud";
import { jurusanConfig } from "../../../config/masterCrud/jurusan.config";

export default function CreateJurusan() {
    return <MasterFormPage config={jurusanConfig} mode="create" />;
}
