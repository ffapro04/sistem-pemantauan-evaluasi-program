/* eslint-disable react/prop-types */
/* eslint-disable react/prop-types */
export default function PageWrapper({ children, className = "" }) {
  return (
    <div className={`h-screen w-full flex p-0 m-0 ${className}`}>
      {children}
    </div>
  );
}

