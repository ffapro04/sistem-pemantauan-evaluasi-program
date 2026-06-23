import { MasterReadPage } from "../../../../components/masterCrud";
import { operatorSekolahConfig } from "../../../../config/masterCrud/operatorSekolah.config";

export default function ReadOperatorSekolah() {
    return <MasterReadPage config={operatorSekolahConfig} />;
}
