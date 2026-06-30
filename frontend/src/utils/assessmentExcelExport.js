const EXPORT_COLORS = {
  blue: "0055DA",
  cyan: "00C68D",
  pink: "FF0052",
  yellow: "FFD400",
  purple: "360185",
  magenta: "8F0177",
  orange: "F4B342",
  dark: "083344",
  lightBlue: "EAF6FF",
  lightPink: "FFF0F5",
  lightYellow: "FFF8D6",
  white: "FFFFFF",
  slate: "64748B",
};

const ANSWER_COLORS = [
  EXPORT_COLORS.pink,
  EXPORT_COLORS.yellow,
  EXPORT_COLORS.cyan,
  EXPORT_COLORS.blue,
];

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const safeText = (value, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const formatDateValue = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date;
};

const getQuestionId = (question) =>
  question?.id_pertanyaan ?? question?.id ?? question?.question_id ?? null;

const getQuestionText = (question) =>
  question?.teks ||
  question?.question ||
  question?.pertanyaan ||
  question?.nama_pertanyaan ||
  "Belum ada pertanyaan";

const getQuestionOptions = (question) => {
  const rawOptions =
    question?.pilihan ||
    question?.options ||
    question?.opsi ||
    question?.jawaban_opsi ||
    [];

  if (!Array.isArray(rawOptions)) return [];

  return rawOptions
    .map((option) => {
      if (typeof option === "string") return option;
      return option?.label || option?.teks || option?.option || option?.jawaban || "-";
    })
    .filter(Boolean)
    .slice(0, 4);
};

const getAnswerForQuestion = (pengisi, questionId) => {
  const answers = normalizeArray(pengisi?.jawaban);
  return answers.find(
    (item) =>
      Number(item?.id_pertanyaan ?? item?.question_id ?? item?.id) === Number(questionId),
  );
};

const normalizePilar = (value, jenis) => {
  const text = String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (text.includes("KECAKAPAN")) return "Kecakapan Hidup";
  if (text.includes("SENI")) return "Seni Budaya";
  if (text.includes("KARAKTER")) return "Karakter";
  if (text.includes("AKADEMIK")) return "Akademik";

  return String(jenis || "").toLowerCase().includes("non") ? "Seni Budaya" : "Akademik";
};

const buildFileName = (assessment, id) => {
  const base = safeText(assessment?.nama_assessment || assessment?.nama || `assessment-${id}`)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 120);

  return `${base || `assessment-${id}`}.xlsx`;
};

const styleCell = (sheet, address, style) => {
  if (!sheet[address]) return;
  sheet[address].s = { ...(sheet[address].s || {}), ...style };
};

const styleRange = (XLSX, sheet, rangeAddress, style) => {
  const range = XLSX.utils.decode_range(rangeAddress);
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      styleCell(sheet, XLSX.utils.encode_cell({ r: row, c: col }), style);
    }
  }
};

const cellAddress = (XLSX, rowIndex, colIndex) =>
  XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });

const columnAddress = (XLSX, colIndex) => XLSX.utils.encode_col(colIndex);

const titleStyle = {
  font: { bold: true, sz: 18, color: { rgb: EXPORT_COLORS.white } },
  fill: { fgColor: { rgb: EXPORT_COLORS.dark } },
  alignment: { horizontal: "center", vertical: "center" },
};

const sectionStyle = {
  font: { bold: true, color: { rgb: EXPORT_COLORS.white } },
  fill: { fgColor: { rgb: EXPORT_COLORS.blue } },
  alignment: { horizontal: "center", vertical: "center" },
};

const headerStyle = {
  font: { bold: true, color: { rgb: EXPORT_COLORS.white } },
  fill: { fgColor: { rgb: EXPORT_COLORS.blue } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "thin", color: { rgb: "D9E2F3" } },
    bottom: { style: "thin", color: { rgb: "D9E2F3" } },
  },
};

const cardLabelStyle = {
  font: { bold: true, color: { rgb: EXPORT_COLORS.slate } },
  fill: { fgColor: { rgb: EXPORT_COLORS.lightBlue } },
};

const cardValueStyle = {
  font: { bold: true, sz: 14, color: { rgb: EXPORT_COLORS.dark } },
  fill: { fgColor: { rgb: EXPORT_COLORS.lightBlue } },
};

const percentFormat = "0%";
const dateFormat = "dd mmm yyyy";

const createSummarySheet = (XLSX, assessment, summary) => {
  const rows = [
    ["HASIL ASSESSMENT", "", "", "", "", "", "", ""],
    ["Ringkasan umum export hasil assessment", "", "", "", "", "", "", ""],
    [],
    ["Nama Assessment", assessment.nama_assessment || "-", "", "Jenis", assessment.jenis || "-", "", "Pilar", summary.pilar],
    ["Tanggal Kirim", formatDateValue(assessment.sent_at), "", "Deadline", formatDateValue(assessment.deadline), "", "Progress", summary.completionRate / 100],
    [],
    ["Total Responden", summary.totalResponden, "", "Sudah Mengisi", summary.sudahMengisi, "", "Belum Mengisi", summary.belumMengisi],
    [],
    ["Sekolah Sasaran", "NPSN", "Wilayah", "Akreditasi", "", "", "", ""],
    ...summary.schools.map((school) => [
      school.nama || school.nama_sekolah || "-",
      school.npsn || "-",
      school.wilayah || school.nama_wilayah || "-",
      school.akreditasi || "-",
      "",
      "",
      "",
      "",
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];
  sheet["!cols"] = [
    { wch: 26 },
    { wch: 20 },
    { wch: 4 },
    { wch: 18 },
    { wch: 20 },
    { wch: 4 },
    { wch: 18 },
    { wch: 20 },
  ];

  styleRange(XLSX, sheet, "A1:H1", titleStyle);
  styleRange(XLSX, sheet, "A2:H2", {
    font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
    fill: { fgColor: { rgb: EXPORT_COLORS.yellow } },
    alignment: { horizontal: "center" },
  });
  ["A4", "D4", "G4", "A5", "D5", "G5", "A7", "D7", "G7"].forEach((cell) =>
    styleCell(sheet, cell, cardLabelStyle),
  );
  ["B4", "E4", "H4", "B5", "E5", "H5", "B7", "E7", "H7"].forEach((cell) =>
    styleCell(sheet, cell, cardValueStyle),
  );
  styleRange(XLSX, sheet, "A9:D9", headerStyle);
  sheet["H5"].z = percentFormat;
  sheet["B5"].z = dateFormat;
  sheet["E5"].z = dateFormat;
  sheet["!freeze"] = { xSplit: 0, ySplit: 9 };

  return sheet;
};

const createVisualSheetLegacy = (XLSX, questions, respondents) => {
  const rows = [["DIAGRAM VISUAL HASIL ASSESSMENT", "", "", "", "", "", ""]];
  rows.push(["Setiap blok menampilkan komposisi jawaban per pertanyaan seperti diagram pada halaman detail.", "", "", "", "", "", ""]);
  rows.push([]);

  questions.forEach((question, questionIndex) => {
    const questionId = getQuestionId(question);
    const options = getQuestionOptions(question);
    const startRow = rows.length;

    rows.push([`Pertanyaan ${questionIndex + 1}`, getQuestionText(question), "", "", "", "", ""]);
    rows.push(["Opsi Jawaban", "Jumlah", "Persentase", "Diagram Visual", "", "", ""]);

    options.forEach((option, optionIndex) => {
      const jumlah = respondents.filter((pengisi) => {
        const answer = getAnswerForQuestion(pengisi, questionId);
        return answer?.jawaban === option;
      }).length;
      const percentage = respondents.length > 0 ? jumlah / respondents.length : 0;
      const bar = "■".repeat(Math.max(1, Math.round(percentage * 24)));
      rows.push([option, jumlah, percentage, bar, "", "", ""]);
    });

    if (options.length === 0) {
      rows.push(["Belum ada opsi", 0, 0, "", "", "", ""]);
    }

    rows.push([]);
    rows[startRow]._questionRow = true;
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  sheet["!cols"] = [
    { wch: 34 },
    { wch: 12 },
    { wch: 14 },
    { wch: 42 },
    { wch: 4 },
    { wch: 4 },
    { wch: 4 },
  ];

  styleRange(XLSX, sheet, "A1:G1", titleStyle);
  styleRange(XLSX, sheet, "A2:G2", {
    font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
    fill: { fgColor: { rgb: EXPORT_COLORS.yellow } },
    alignment: { horizontal: "center" },
  });

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    if (String(row[0] || "").startsWith("Pertanyaan ")) {
      styleRange(XLSX, sheet, `A${rowNumber}:G${rowNumber}`, sectionStyle);
    }
    if (row[0] === "Opsi Jawaban") {
      styleRange(XLSX, sheet, `A${rowNumber}:D${rowNumber}`, headerStyle);
    }
    if (typeof row[2] === "number") {
      const color = ANSWER_COLORS[(index + 1) % ANSWER_COLORS.length];
      styleCell(sheet, `C${rowNumber}`, { numFmt: percentFormat, z: percentFormat });
      styleCell(sheet, `D${rowNumber}`, {
        font: { bold: true, color: { rgb: color } },
        fill: { fgColor: { rgb: "FFFFFF" } },
      });
    }
  });

  return sheet;
};

const createVisualSheetGrid = (XLSX, questions, respondents) => {
  const chartStartCol = 3;
  const chartWidth = 24;
  const totalCols = chartStartCol + chartWidth + 3;
  const rows = [
    Array(totalCols).fill(""),
    Array(totalCols).fill(""),
    Array(totalCols).fill(""),
  ];
  const chartMeta = [];

  rows[0][0] = "DIAGRAM VISUAL HASIL ASSESSMENT";
  rows[1][0] =
    "Visualisasi distribusi jawaban per pertanyaan dibuat mengikuti grafik pada halaman detail assessment.";
  rows[2][0] = "Legenda Warna";
  rows[2][1] = "Opsi 1";
  rows[2][2] = "Opsi 2";
  rows[2][3] = "Opsi 3";
  rows[2][4] = "Opsi 4";

  questions.forEach((question, questionIndex) => {
    const questionId = getQuestionId(question);
    const options = getQuestionOptions(question);
    const startRow = rows.length;

    rows.push(Array(totalCols).fill(""));
    rows[startRow][0] = `Pertanyaan ${questionIndex + 1}`;
    rows[startRow][1] = getQuestionText(question);

    const headerRow = rows.length;
    rows.push(Array(totalCols).fill(""));
    rows[headerRow][0] = "Opsi Jawaban";
    rows[headerRow][1] = "Jumlah";
    rows[headerRow][2] = "Persentase";
    rows[headerRow][3] = "Diagram Visual";
    rows[headerRow][chartStartCol + chartWidth] = "Label";
    rows[headerRow][chartStartCol + chartWidth + 1] = "Insight";

    const answerRows = [];
    const optionRows = options.length > 0 ? options : ["Belum ada opsi"];

    optionRows.forEach((option, optionIndex) => {
      const jumlah = respondents.filter((pengisi) => {
        const answer = getAnswerForQuestion(pengisi, questionId);
        return answer?.jawaban === option;
      }).length;
      const percentage = respondents.length > 0 ? jumlah / respondents.length : 0;
      const rowIndex = rows.length;
      const percentText = `${Math.round(percentage * 100)}%`;
      const insight =
        percentage >= 0.7
          ? "Mayoritas"
          : percentage >= 0.35
            ? "Cukup dominan"
            : jumlah > 0
              ? "Minoritas"
              : "Belum dipilih";

      rows.push(Array(totalCols).fill(""));
      rows[rowIndex][0] = option;
      rows[rowIndex][1] = jumlah;
      rows[rowIndex][2] = percentage;
      rows[rowIndex][3] = "|".repeat(Math.max(1, Math.round(percentage * chartWidth)));
      rows[rowIndex][chartStartCol + chartWidth] = percentText;
      rows[rowIndex][chartStartCol + chartWidth + 1] = insight;

      answerRows.push({
        rowIndex,
        optionIndex,
        fillCount: Math.round(percentage * chartWidth),
        percentage,
      });
    });

    rows.push([]);
    chartMeta.push({ startRow, headerRow, answerRows });
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
  ];
  sheet["!cols"] = Array.from({ length: totalCols }, (_, index) => {
    if (index === 0) return { wch: 34 };
    if (index === 1) return { wch: 12 };
    if (index === 2) return { wch: 14 };
    if (index >= chartStartCol && index < chartStartCol + chartWidth) return { wch: 2.8 };
    if (index === chartStartCol + chartWidth) return { wch: 10 };
    return { wch: 18 };
  });
  sheet["!rows"] = rows.map((_, index) => ({ hpt: index < 3 ? 24 : 22 }));

  styleRange(
    XLSX,
    sheet,
    `A1:${columnAddress(XLSX, totalCols - 1)}1`,
    titleStyle,
  );
  styleRange(XLSX, sheet, `A2:${columnAddress(XLSX, totalCols - 1)}2`, {
    font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
    fill: { fgColor: { rgb: EXPORT_COLORS.yellow } },
    alignment: { horizontal: "center" },
  });
  styleRange(XLSX, sheet, `A3:${columnAddress(XLSX, totalCols - 1)}3`, {
    font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
    fill: { fgColor: { rgb: EXPORT_COLORS.lightBlue } },
    alignment: { horizontal: "center" },
  });

  ANSWER_COLORS.forEach((color, index) => {
    styleCell(sheet, cellAddress(XLSX, 2, index + 1), {
      font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
      fill: { fgColor: { rgb: color } },
      alignment: { horizontal: "center" },
    });
  });

  chartMeta.forEach(({ startRow, headerRow, answerRows }) => {
    const titleRange = `A${startRow + 1}:${columnAddress(XLSX, totalCols - 1)}${startRow + 1}`;
    const headerRange = `A${headerRow + 1}:${columnAddress(XLSX, totalCols - 1)}${headerRow + 1}`;

    sheet["!merges"].push({
      s: { r: startRow, c: 1 },
      e: { r: startRow, c: totalCols - 1 },
    });
    styleRange(XLSX, sheet, titleRange, sectionStyle);
    styleRange(XLSX, sheet, headerRange, headerStyle);

    answerRows.forEach(({ rowIndex, optionIndex, fillCount, percentage }) => {
      const color = ANSWER_COLORS[optionIndex % ANSWER_COLORS.length];
      const rowNumber = rowIndex + 1;

      styleCell(sheet, cellAddress(XLSX, rowIndex, 0), {
        font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
        alignment: { vertical: "center", wrapText: true },
      });
      styleCell(sheet, cellAddress(XLSX, rowIndex, 1), {
        font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
        alignment: { horizontal: "center" },
      });
      styleCell(sheet, cellAddress(XLSX, rowIndex, 2), {
        numFmt: percentFormat,
        z: percentFormat,
        font: { bold: true, color: { rgb: color } },
        alignment: { horizontal: "center" },
      });
      styleCell(sheet, cellAddress(XLSX, rowIndex, 3), {
        font: { bold: true, color: { rgb: color } },
      });
      styleCell(sheet, cellAddress(XLSX, rowIndex, chartStartCol + chartWidth), {
        font: { bold: true, color: { rgb: color } },
        alignment: { horizontal: "center" },
      });

      for (let col = chartStartCol; col < chartStartCol + chartWidth; col += 1) {
        const filled = col - chartStartCol < fillCount;
        styleCell(sheet, cellAddress(XLSX, rowIndex, col), {
          fill: { fgColor: { rgb: filled ? color : "EEF2F7" } },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } },
          },
        });
      }

      if (percentage === 0) {
        styleRange(
          XLSX,
          sheet,
          `${columnAddress(XLSX, chartStartCol)}${rowNumber}:${columnAddress(XLSX, chartStartCol + chartWidth - 1)}${rowNumber}`,
          { fill: { fgColor: { rgb: "F8FAFC" } } },
        );
      }
    });
  });

  sheet["!freeze"] = { xSplit: 0, ySplit: 3 };

  return sheet;
};

const createVisualSheet = (XLSX, questions, respondents) => {
  const rows = [
    ["DIAGRAM VISUAL HASIL ASSESSMENT", "", "", "", "", ""],
    [
      "Setiap pertanyaan ditampilkan sebagai grafik batang horizontal yang mudah dibaca.",
      "",
      "",
      "",
      "",
      "",
    ],
    [],
  ];
  const questionRows = [];
  const headerRows = [];
  const answerRows = [];
  const barWidth = 42;

  questions.forEach((question, questionIndex) => {
    const questionId = getQuestionId(question);
    const options = getQuestionOptions(question);
    const distributions = (options.length > 0 ? options : ["Belum ada opsi"])
      .map((option) => {
        const jumlah = respondents.filter((pengisi) => {
          const answer = getAnswerForQuestion(pengisi, questionId);
          return answer?.jawaban === option;
        }).length;
        const percent = respondents.length > 0 ? jumlah / respondents.length : 0;
        return {
          option,
          jumlah,
          percent,
          percentLabel: `${Math.round(percent * 100)}%`,
          insight:
            percent >= 0.7
              ? "Mayoritas"
              : percent >= 0.35
                ? "Cukup dominan"
                : jumlah > 0
                  ? "Minoritas"
                  : "Belum dipilih",
        };
      })
      .sort((a, b) => b.jumlah - a.jumlah);

    const topAnswer = distributions[0];
    const questionRow = rows.length;
    questionRows.push(questionRow);
    rows.push([
      `SOAL ${questionIndex + 1}`,
      getQuestionText(question),
      "",
      "",
      "",
      topAnswer
        ? `Jawaban tertinggi: ${topAnswer.option} (${topAnswer.percentLabel})`
        : "Belum ada jawaban",
    ]);

    const headerRow = rows.length;
    headerRows.push(headerRow);
    rows.push(["Opsi Jawaban", "Jumlah", "Persentase", "Grafik Batang", "Skala", "Insight"]);

    distributions.forEach((item, itemIndex) => {
      const filled = Math.round(item.percent * barWidth);
      const bar =
        filled > 0
          ? `${"█".repeat(filled)}${"░".repeat(Math.max(barWidth - filled, 0))}`
          : "░".repeat(barWidth);
      const rowIndex = rows.length;
      answerRows.push({ rowIndex, itemIndex, percent: item.percent });
      rows.push([
        item.option,
        item.jumlah,
        item.percent,
        bar,
        `${item.percentLabel} dari ${respondents.length} pengisi`,
        item.insight,
      ]);
    });

    rows.push([]);
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];
  sheet["!cols"] = [
    { wch: 28 },
    { wch: 10 },
    { wch: 12 },
    { wch: 58 },
    { wch: 22 },
    { wch: 28 },
  ];
  sheet["!rows"] = rows.map((_, index) => ({
    hpt: questionRows.includes(index) ? 34 : headerRows.includes(index) ? 24 : 22,
  }));

  styleRange(XLSX, sheet, "A1:F1", titleStyle);
  styleRange(XLSX, sheet, "A2:F2", {
    font: { bold: true, color: { rgb: EXPORT_COLORS.dark } },
    fill: { fgColor: { rgb: EXPORT_COLORS.yellow } },
    alignment: { horizontal: "center" },
  });

  questionRows.forEach((rowIndex) => {
    const rowNumber = rowIndex + 1;
    sheet["!merges"].push({ s: { r: rowIndex, c: 1 }, e: { r: rowIndex, c: 4 } });
    styleRange(XLSX, sheet, `A${rowNumber}:F${rowNumber}`, {
      font: { bold: true, sz: 13, color: { rgb: EXPORT_COLORS.white } },
      fill: { fgColor: { rgb: EXPORT_COLORS.dark } },
      alignment: { vertical: "center", wrapText: true },
    });
  });

  headerRows.forEach((rowIndex) => {
    styleRange(XLSX, sheet, `A${rowIndex + 1}:F${rowIndex + 1}`, headerStyle);
  });

  answerRows.forEach(({ rowIndex, itemIndex }) => {
    const rowNumber = rowIndex + 1;
    const color = ANSWER_COLORS[itemIndex % ANSWER_COLORS.length];
    styleCell(sheet, `C${rowNumber}`, { numFmt: percentFormat, z: percentFormat });
    styleCell(sheet, `D${rowNumber}`, {
      font: { bold: true, color: { rgb: color }, name: "Consolas" },
    });
    styleRange(XLSX, sheet, `A${rowNumber}:F${rowNumber}`, {
      alignment: { vertical: "center", wrapText: true },
    });
  });

  sheet["!freeze"] = { xSplit: 0, ySplit: 3 };

  return sheet;
};

const createGroupedSheet = (XLSX, questions, respondents) => {
  const rows = [
    ["PENGELOMPOKAN DATA ASSESSMENT", "", "", "", "", ""],
    ["Pertanyaan", "Opsi Jawaban", "Jumlah", "Persentase", "Total Pengisi", "Insight Cepat"],
  ];

  questions.forEach((question, questionIndex) => {
    const questionId = getQuestionId(question);
    const options = getQuestionOptions(question);

    options.forEach((option) => {
      const jumlah = respondents.filter((pengisi) => {
        const answer = getAnswerForQuestion(pengisi, questionId);
        return answer?.jawaban === option;
      }).length;
      const percentage = respondents.length > 0 ? jumlah / respondents.length : 0;
      rows.push([
        `${questionIndex + 1}. ${getQuestionText(question)}`,
        option,
        jumlah,
        percentage,
        respondents.length,
        percentage >= 0.7 ? "Mayoritas" : percentage >= 0.35 ? "Cukup dominan" : "Perlu perhatian",
      ]);
    });
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
  sheet["!cols"] = [
    { wch: 64 },
    { wch: 28 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
  ];
  sheet["!autofilter"] = { ref: `A2:F${Math.max(rows.length, 2)}` };
  styleRange(XLSX, sheet, "A1:F1", titleStyle);
  styleRange(XLSX, sheet, "A2:F2", headerStyle);
  if (rows.length > 2) {
    styleRange(XLSX, sheet, `D3:D${rows.length}`, { numFmt: percentFormat, z: percentFormat });
  }
  sheet["!freeze"] = { xSplit: 0, ySplit: 2 };

  return sheet;
};

const createRawSheet = (XLSX, questions, respondents) => {
  const rows = [
    ["DATA MENTAH JAWABAN", "", "", "", "", "", ""],
    ["Nama Pengisi", "Sekolah", "Tanggal Mengisi", "No Pertanyaan", "Pertanyaan", "Jawaban", "Skor"],
  ];

  respondents.forEach((pengisi) => {
    normalizeArray(pengisi.jawaban).forEach((jawaban) => {
      const question = questions.find(
        (item) => Number(getQuestionId(item)) === Number(jawaban.id_pertanyaan),
      );
      rows.push([
        pengisi.nama || "-",
        pengisi.sekolah || "-",
        formatDateValue(pengisi.tanggal_mengisi),
        question?.nomor || "",
        getQuestionText(question),
        jawaban.jawaban || "",
        jawaban.skor ?? "",
      ]);
    });
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  sheet["!cols"] = [
    { wch: 28 },
    { wch: 34 },
    { wch: 18 },
    { wch: 14 },
    { wch: 64 },
    { wch: 26 },
    { wch: 10 },
  ];
  sheet["!autofilter"] = { ref: `A2:G${Math.max(rows.length, 2)}` };
  styleRange(XLSX, sheet, "A1:G1", titleStyle);
  styleRange(XLSX, sheet, "A2:G2", headerStyle);
  if (rows.length > 2) {
    styleRange(XLSX, sheet, `C3:C${rows.length}`, { numFmt: dateFormat, z: dateFormat });
  }
  sheet["!freeze"] = { xSplit: 0, ySplit: 2 };

  return sheet;
};

export function exportAssessmentResultWorkbook(XLSX, assessment, options = {}) {
  const id = options.id || assessment?.id_assessment || assessment?.id || "assessment";
  const questions = normalizeArray(assessment?.pertanyaan);
  const respondents = normalizeArray(assessment?.pengisi);
  const totalResponden = Number(assessment?.total_responden || 0);
  const sudahMengisi = respondents.length;
  const belumMengisi = Math.max(totalResponden - sudahMengisi, 0);
  const completionRate = totalResponden > 0 ? Math.round((sudahMengisi / totalResponden) * 100) : 0;
  const summary = {
    totalResponden,
    sudahMengisi,
    belumMengisi,
    completionRate,
    pilar: normalizePilar(
      assessment?.pilar ||
        assessment?.pillar ||
        assessment?.pilar_assessment ||
        assessment?.pilarAssessment,
      assessment?.jenis,
    ),
    schools: normalizeArray(assessment?.sekolah_profile),
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, createSummarySheet(XLSX, assessment, summary), "Ringkasan");
  XLSX.utils.book_append_sheet(workbook, createVisualSheet(XLSX, questions, respondents), "Diagram Visual");
  XLSX.utils.book_append_sheet(workbook, createGroupedSheet(XLSX, questions, respondents), "Pengelompokan Data");
  XLSX.utils.book_append_sheet(workbook, createRawSheet(XLSX, questions, respondents), "Data Mentah");

  XLSX.writeFile(workbook, buildFileName(assessment, id), {
    bookType: "xlsx",
    compression: true,
  });
}
