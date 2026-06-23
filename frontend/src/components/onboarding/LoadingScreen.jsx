import React from "react";

function LoadingScreen() {
    return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="relative">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#0AC4E0]/20 border-t-[#0AC4E0]" />
                <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-[#0AC4E0]" />
            </div>
        </div>
    );
}

export default LoadingScreen;
