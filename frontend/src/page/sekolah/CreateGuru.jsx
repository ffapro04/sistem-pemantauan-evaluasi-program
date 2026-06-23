import { MasterFormPage } from "../../components/masterCrud";
import { guruConfig } from "../../config/masterCrud/guru.config";

export default function CreateGuru() {
    return <MasterFormPage config={guruConfig} mode="create" />;
}
