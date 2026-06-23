import L from "leaflet";

const makePinSVG = (mainColor, shadowColor) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
      <ellipse cx="50" cy="112" rx="18" ry="7" fill="${shadowColor}" opacity="0.85"/>
      <path d="M50 8 C28 8 12 26 12 48 C12 72 50 108 50 108 C50 108 88 72 88 48 C88 26 72 8 50 8 Z" fill="${mainColor}"/>
      <circle cx="50" cy="46" r="18" fill="white"/>
    </svg>
  `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const cyanPinIcon = L.icon({
    iconUrl: makePinSVG("#0AC4E0", "#0077aa"),
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
});

export const orangePinIcon = L.icon({
    iconUrl: makePinSVG("#F97316", "#c2410c"),
    iconSize: [42, 52],
    iconAnchor: [21, 52],
    popupAnchor: [0, -48],
});
