import PropTypes from "prop-types";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function MapController({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        if (!center || !map) return;

        const lat = Number(center[0]);
        const lng = Number(center[1]);

        if (Number.isNaN(lat) || Number.isNaN(lng) || lat === 0 || lng === 0) {
            return;
        }

        map.flyTo(center, zoom, { duration: 1.15 });
    }, [center, zoom, map]);

    return null;
}

MapController.propTypes = {
    center: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
};

export default MapController;
