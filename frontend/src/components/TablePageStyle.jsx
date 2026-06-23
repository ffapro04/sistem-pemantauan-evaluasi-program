function TablePageStyle() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-in {
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
          }

          thead th {
            background-color: #0AC4E0 !important;
            color: white !important;
            font-size: 10px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.12em !important;
            padding: 1.15rem 1.5rem !important;
            border: none !important;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          thead th:first-child {
            border-top-left-radius: 2.2rem !important;
          }

          thead th:last-child {
            border-top-right-radius: 2.2rem !important;
          }

          tbody td {
            padding: 0.85rem 1.5rem !important;
            border-bottom: 1px solid #F8FAFC !important;
            vertical-align: middle !important;
          }

          tbody tr:last-child td {
            border-bottom: none !important;
          }

          tbody tr:hover td {
            background-color: rgba(10, 196, 224, 0.04) !important;
            transition: all 0.2s ease;
          }
        `,
            }}
        />
    );
}

export default TablePageStyle;
