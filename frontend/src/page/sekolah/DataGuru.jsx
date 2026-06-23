import { MasterReadPage } from "../../components/masterCrud";
import { guruConfig } from "../../config/masterCrud/guru.config";

export default function DataGuru() {
    return <MasterReadPage config={guruConfig} />;
}
