/* eslint-disable react/prop-types */
export default function Table({ columns = [], data = [], footer }) {
  return (
    <div className="w-full bg-white rounded-[1.8rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden ring-1 ring-black/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">

          {/* HEADER */}
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    backgroundColor: "#0AC4E0",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    padding: "1.5rem",
                    border: "none",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    whiteSpace: "nowrap",
                    minWidth: col.minWidth || "140px",
                    ...(index === 0 ? { borderTopLeftRadius: "1.8rem" } : {}),
                    ...(index === columns.length - 1 ? { borderTopRightRadius: "1.8rem" } : {}),
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
                  <div className="flex flex-col items-center justify-center opacity-20 text-gray-900">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="mb-3">
                      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5" /><path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6" />
                    </svg>
                    <p style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>
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
                        borderBottom: "1px solid #F8FAFC",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                        minWidth: col.minWidth || "140px",
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
