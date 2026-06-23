import { MasterFormPage } from "../../../../components/masterCrud";
import { operatorSekolahConfig } from "../../../../config/masterCrud/operatorSekolah.config";

export default function EditOperatorSekolah() {
    return <MasterFormPage config={operatorSekolahConfig} mode="edit" />;
}
