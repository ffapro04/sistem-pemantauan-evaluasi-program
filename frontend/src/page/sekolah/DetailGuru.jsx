import { MasterDetailPage } from "../../components/masterCrud";
import { guruConfig } from "../../config/masterCrud/guru.config";

export default function DetailGuru() {
    return <MasterDetailPage config={guruConfig} />;
}

