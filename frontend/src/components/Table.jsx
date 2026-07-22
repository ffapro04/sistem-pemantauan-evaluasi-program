/* eslint-disable react/prop-types */
export default function Table({ columns = [], data = [], footer }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_34px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">

          {/* HEADER */}
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    backgroundColor: "#0AC4E0",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "0.95rem 1rem",
                    border: "none",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    whiteSpace: "normal",
                    minWidth: col.minWidth || undefined,
                    width: col.width || undefined,
                  }}
                  className={col.align || "text-left"}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="text-gray-600">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "5rem 1.5rem", textAlign: "center", border: "none" }}
                >
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <p style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Data Tidak Ditemukan
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#fbfcff",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f9ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#fbfcff")}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid #F1F5F9",
                        verticalAlign: "middle",
                        whiteSpace: "normal",
                        minWidth: col.minWidth || undefined,
                        width: col.width || undefined,
                        color: "#0f172a",
                        fontSize: "12px",
                        fontWeight: 700,
                        lineHeight: 1.45,
                      }}
                      className={col.align || "text-left"}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* FOOTER */}
          {footer && (
            <tfoot className="bg-[#F8FAFF] border-t-2 border-[#0AC4E0]/10">
              {footer}
            </tfoot>
          )}

        </table>
      </div>
    </div>
  );
}
