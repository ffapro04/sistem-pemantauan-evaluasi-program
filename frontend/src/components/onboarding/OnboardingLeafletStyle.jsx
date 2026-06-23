import React from "react";

function OnboardingLeafletStyle() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          .leaflet-container {
            font-family: inherit;
            z-index: 1;
            border: none !important;
            width: 100%;
            height: 100%;
            background: #F1F5F9 !important;
          }

          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12) !important;
          }

          .leaflet-control-zoom a {
            background: white !important;
            color: #0AC4E0 !important;
            border-radius: 12px !important;
            margin: 4px !important;
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            border: 1px solid #E2E8F0 !important;
          }

          .leaflet-control-zoom a:hover {
            background: #0AC4E0 !important;
            color: white !important;
          }

          .leaflet-popup-content-wrapper {
            overflow: hidden !important;
            border-radius: 20px !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18) !important;
          }

          .leaflet-popup-content {
            margin: 0 !important;
          }

          .leaflet-popup-tip {
            background: white !important;
            box-shadow: none !important;
          }
        `,
            }}
        />
    );
}

export default OnboardingLeafletStyle;
