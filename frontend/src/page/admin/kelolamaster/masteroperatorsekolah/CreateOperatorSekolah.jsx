import { MasterFormPage } from "../../../../components/masterCrud";
import { operatorSekolahConfig } from "../../../../config/masterCrud/operatorSekolah.config";

export default function CreateOperatorSekolah() {
    return <MasterFormPage config={operatorSekolahConfig} mode="create" />;
}
