/* eslint-disable react/prop-types */
import { cn } from "../design/tokens";

export default function Table({
  columns = [],
  data = [],
  footer,
  className = "",
  headerClassName = "",
  rowClassName,
  cellClassName,
  emptyMessage = "Data Tidak Ditemukan",
}) {
  const resolveRowClass = (row, index) =>
    typeof rowClassName === "function" ? rowClassName(row, index) : rowClassName;

  const resolveCellClass = (row, index) =>
    typeof cellClassName === "function" ? cellClassName(row, index) : cellClassName;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_34px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className={cn("w-full table-auto border-collapse", className)}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    minWidth: col.minWidth || undefined,
                    width: col.width || undefined,
                  }}
                  className={cn(
                    "sticky top-0 z-10 whitespace-normal border-none bg-[#0AC4E0] px-4 py-[0.95rem] text-[11px] font-black uppercase tracking-[0.06em] text-white first:rounded-tl-2xl last:rounded-tr-2xl",
                    col.align || "text-left",
                    headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F5F9] text-gray-600">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="border-none px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <p className="text-[11px] font-black uppercase tracking-[0.08em]">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    rowIndex % 2 === 0 ? "bg-white" : "bg-[#fbfcff]",
                    "transition-colors duration-200 hover:bg-[#0AC4E0]/[0.04]",
                    resolveRowClass(row, rowIndex),
                  )}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        minWidth: col.minWidth || undefined,
                        width: col.width || undefined,
                      }}
                      className={cn(
                        "whitespace-normal px-6 py-4 align-middle text-[12px] font-bold leading-[1.45] text-slate-950",
                        col.align || "text-left",
                        resolveCellClass(row, rowIndex),
                      )}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {footer && (
            <tfoot className="border-t-2 border-[#0AC4E0]/10 bg-[#F8FAFF]">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
