/* eslint-disable react/prop-types */
export default function Arrow({ direction = "right" }) {
  // RIGHT & LEFT
  if (direction === "right" || direction === "left") {
    return (
      <div className="hidden md:flex items-center mx-3">
        <svg
          className={direction === "left" ? "rotate-180" : ""}
          width="24"
          height="12"
          viewBox="0 0 24 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 6H18M18 6L14 2M18 6L14 10"
            stroke="#0a5ea8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // DOWN (LURUS KE BAWAH)
  if (direction === "down") {
    return (
      <div className="hidden md:flex justify-end pr-41">
        <svg
          width="12"
          height="40"
          viewBox="0 0 12 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 0V34"
            stroke="#0a5ea8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6 34L2 30M6 34L10 30"
            stroke="#0a5ea8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return null;
}

