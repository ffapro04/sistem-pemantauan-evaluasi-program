import PropTypes from "prop-types";
import Card from "./Card";

function FormSection({ icon, title, children, className = "" }) {
  return (
    <Card
      className={`!m-0 space-y-6 !rounded-[2rem] !border !border-white !bg-white !p-7 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
            {icon}
          </div>
        )}

        <h2 className="text-[15px] font-black tracking-tight text-slate-800">
          {title}
        </h2>
      </div>

      {children}
    </Card>
  );
}

FormSection.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default FormSection;
