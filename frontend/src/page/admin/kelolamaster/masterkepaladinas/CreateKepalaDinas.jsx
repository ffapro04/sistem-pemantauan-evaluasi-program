import { MasterFormPage } from "../../../../components/masterCrud";
import { kepalaDinasConfig } from "../../../../config/masterCrud/kepalaDinas.config";

export default function CreateKepalaDinas() {
    return <MasterFormPage config={kepalaDinasConfig} mode="create" />;
}
