import { MasterDetailPage } from "../../../../components/masterCrud";
import { kepalaDinasConfig } from "../../../../config/masterCrud/kepalaDinas.config";

export default function DetailKepalaDinas() {
    return <MasterDetailPage config={kepalaDinasConfig} />;
}
