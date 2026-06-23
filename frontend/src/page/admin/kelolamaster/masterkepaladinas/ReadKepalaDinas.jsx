import { MasterReadPage } from "../../../../components/masterCrud";
import { kepalaDinasConfig } from "../../../../config/masterCrud/kepalaDinas.config";

export default function ReadKepalaDinas() {
    return <MasterReadPage config={kepalaDinasConfig} />;
}
