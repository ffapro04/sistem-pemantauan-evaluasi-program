import { MasterFormPage } from "../../../../components/masterCrud";
import { kepalaDinasConfig } from "../../../../config/masterCrud/kepalaDinas.config";

export default function EditKepalaDinas() {
    return <MasterFormPage config={kepalaDinasConfig} mode="edit" />;
}
