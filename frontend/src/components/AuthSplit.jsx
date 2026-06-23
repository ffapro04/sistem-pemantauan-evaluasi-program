/* eslint-disable react/prop-types */
export default function AuthSplit({ children, rightContent }) {
  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE (Form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* RIGHT SIDE (Static Illustration) */}
      <div className="hidden md:flex w-1/2 bg-indigo-400 items-center justify-center p-10">
        <div className="text-white text-center max-w-sm">
          {rightContent}
        </div>
      </div>
    </div>
  );
}

