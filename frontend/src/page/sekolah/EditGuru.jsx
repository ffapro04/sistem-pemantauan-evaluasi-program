import { MasterFormPage } from "../../components/masterCrud";
import { guruConfig } from "../../config/masterCrud/guru.config";

export default function EditGuru() {
    return <MasterFormPage config={guruConfig} mode="edit" />;
}
