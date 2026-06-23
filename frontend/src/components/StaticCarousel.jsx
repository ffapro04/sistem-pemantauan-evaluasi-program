/* eslint-disable react/prop-types */
import { useState } from "react";

export default function StaticCarousel({ slides }) {
  const [active, setActive] = useState(0);

  const current = slides[active];

  return (
    <div className="text-center text-white w-full">
      {/* âœ… Render Slide Object */}
      <div className="transition-all duration-500">
        <h2 className="text-2xl font-bold">{current.title}</h2>

        <p className="mt-3 text-blue-100">
          {current.description}
        </p>

        {current.icon && (
          <div className="text-5xl mt-6">{current.icon}</div>
        )}
      </div>

      {/* âœ… Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`w-3 h-3 rounded-full transition ${
              active === index ? "bg-white" : "bg-white/40"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}

