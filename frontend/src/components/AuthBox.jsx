/* eslint-disable react/prop-types */
export default function AuthBox({ 
  leftContent, 
  rightContent,
  rightContentClassName = "bg-gradient-to-br from-gray-900 to-blue-900"
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {leftContent}
        </div>
      </div>

      {/* Right Panel - Image/Content */}
      <div className={`hidden lg:flex lg:w-1/2 ${rightContentClassName}`}>
        <div className="w-full h-full">
          {rightContent}
        </div>
      </div>
    </div>
  );
}

