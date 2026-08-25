import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppIconButton from "./ui/AppIconButton";

const CYAN = "#0AC4E0";
const CYAN_DARK = "#0891a8";
const CYAN_DIM = "#0AC4E018";
const CYAN_MID = "#0AC4E030";

const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
  if (currentPage >= totalPages - 3)
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  loading,
  showLiveTag = false,
}) => {
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  if (totalItems === 0 && !loading) return null;

  return (
    <div className="flex items-center justify-between mt-auto pt-5 px-1 shrink-0"
      style={{ fontFamily: "'Geist', sans-serif" }}>

      {/* Record info */}
      <div className="flex items-center gap-2.5">
        <div className="w-[2.5px] h-[26px] rounded-full hidden md:block"
          style={{ background: CYAN, opacity: 0.35 }} />
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-400">
            Record Tracking
          </span>
          <span className="text-[11.5px] font-semibold text-gray-500 leading-none">
            {from}-{to}
            <span className="text-gray-400 mx-1.5">of</span>
            <span className="text-gray-700">{totalItems}</span>
          </span>
        </div>
        {showLiveTag && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ background: CYAN_DIM, border: `0.5px solid ${CYAN_MID}`, color: CYAN_DARK }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN }} />
            Live
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-0.5">
        <AppIconButton
          icon={ChevronLeft}
          iconSize={15}
          strokeWidth={2.3}
          variant="nav"
          size="md"
          ariaLabel="Previous page"
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          className="!rounded-[9px] active:scale-90"
        />

        <div className="flex items-center gap-0.5 px-1.5">
          {pages.map((page, i) =>
            page === "..." ? (
              <span key={`e-${i}`}
                className="w-8 h-8 flex items-center justify-center text-[11px] tracking-widest text-gray-400">
                ···
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[13px] font-medium border-none transition-all duration-150 active:scale-90 ${
                  currentPage === page
                    ? "bg-[#0AC4E0] text-white font-semibold"
                    : "bg-transparent text-inherit hover:bg-[#0AC4E0]/10 hover:text-[#0891a8]"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <AppIconButton
          icon={ChevronRight}
          iconSize={15}
          strokeWidth={2.3}
          variant="nav"
          size="md"
          ariaLabel="Next page"
          disabled={currentPage >= totalPages || totalPages === 0 || loading}
          onClick={() => onPageChange(currentPage + 1)}
          className="!rounded-[9px] active:scale-90"
        />
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  showLiveTag: PropTypes.bool,
};

export default Pagination;
