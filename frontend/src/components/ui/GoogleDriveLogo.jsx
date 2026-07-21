import React from "react";

const GoogleDriveLogo = ({ size = 22, className = "", title = "Google Drive" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 56"
        role="img"
        aria-label={title}
        className={className}
    >
        <path d="M24.8 2h14.4l23.6 40.8H48.4L24.8 2Z" fill="#34A853" />
        <path d="M1.2 42.8 24.8 2 32 14.5 15.6 42.8H1.2Z" fill="#FABB05" />
        <path d="M15.6 42.8 8.4 55.2h47.2l7.2-12.4H15.6Z" fill="#4285F4" />
        <path d="M32 14.5 24.8 2h14.4l23.6 40.8H48.4L32 14.5Z" fill="#188038" opacity="0.9" />
    </svg>
);

export default GoogleDriveLogo;
