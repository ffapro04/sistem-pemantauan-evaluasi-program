import { MasterDetailPage } from "../../../../components/masterCrud";
import { operatorSekolahConfig } from "../../../../config/masterCrud/operatorSekolah.config";

export default function DetailOperatorSekolah() {
    return <MasterDetailPage config={operatorSekolahConfig} />;
}
