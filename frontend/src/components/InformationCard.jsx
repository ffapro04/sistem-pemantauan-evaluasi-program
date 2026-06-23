/* eslint-disable react/prop-types */
// components/InformationCard.jsx
import React from "react";
import Button from "./Button";

const InformationCard = ({
  // Layout & Styling
  className = "",
  title = "",
  subtitle = "",
  icon,

  // Badge & Status
  badge,

  // Actions
  showRefresh = false,
  showShare = false,
  onRefresh,
  onShare,
  isRefreshing = false,

  // Content
  children,
}) => {
  // Color mapping untuk badge
  const badgeColors = {
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    red: "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200",
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#0a5ea8]/10 to-[#0d8aff]/10 rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-500"></div>

      {/* Main Card */}
      <div className="relative bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              {title && (
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                  {title}
                </h4>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Badge & Actions */}
          <div className="flex items-center gap-2">
            {/* Badge */}
            {badge && badge.show && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full border ${badgeColors[badge.color] || badgeColors.green}`}
              >
                {badge.text}
              </span>
            )}

            {/* Share Button */}
            {showShare && onShare && (
              <Button
                variant="ghost"
                size="xs"
                icon={
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                }
                className="text-xs text-gray-500 hover:text-[#0a5ea8] px-2 py-1"
                onClick={onShare}
              >
                Share
              </Button>
            )}

            {/* Refresh Button */}
            {showRefresh && onRefresh && (
              <Button
                variant="ghost"
                size="xs"
                icon={
                  <svg
                    className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
                className="text-xs text-gray-500 hover:text-[#0a5ea8] px-2 py-1"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-2">{children}</div>

        {/* Footer (Optional) */}
        {(showRefresh || showShare) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Add footer content here if needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default InformationCard;

