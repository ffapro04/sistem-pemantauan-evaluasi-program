// UI Text Extractor for React/Vite projects.
// Free, local-only, no npm package needed.
// Run from frontend root: node .\scripts\extract-ui-text.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, "src");
const OUTPUT_JSON = path.join(ROOT_DIR, "ui-text-extracted.json");
const OUTPUT_TXT = path.join(ROOT_DIR, "ui-text-extracted.txt");
const OUTPUT_TEMPLATE = path.join(ROOT_DIR, "ui-text-dictionary-template.js");

const VALID_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const IGNORE_DIRS = new Set([
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vite",
    "coverage",
]);

const IGNORE_FILE_PARTS = [
    `${path.sep}i18n${path.sep}localUiTranslator.js`,
    `${path.sep}i18n${path.sep}GlobalUiTranslator.jsx`,
];

function fileExists(targetPath) {
    try {
        return fs.existsSync(targetPath);
    } catch {
        return false;
    }
}

function walkDirectory(directory, result = []) {
    if (!fileExists(directory)) return result;

    const items = fs.readdirSync(directory, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(directory, item.name);

        if (item.isDirectory()) {
            if (!IGNORE_DIRS.has(item.name)) walkDirectory(fullPath, result);
            continue;
        }

        if (!item.isFile()) continue;

        const extension = path.extname(item.name);
        if (!VALID_EXTENSIONS.has(extension)) continue;

        if (IGNORE_FILE_PARTS.some((part) => fullPath.includes(part))) continue;

        result.push(fullPath);
    }

    return result;
}

function normalizeText(value) {
    return String(value || "")
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\t/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function lineNumberFromIndex(source, index) {
    return source.slice(0, index).split("\n").length;
}

function hasHumanLetter(value) {
    return /[A-Za-z]/.test(value);
}

function isLikelyTailwindClass(value) {
    const text = normalizeText(value);
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return false;

    const classLikeCount = parts.filter((part) => {
        return (
            /^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|overflow|truncate)$/.test(part) ||
            /^(items|justify|content|self|place)-/.test(part) ||
            /^(bg|text|border|ring|shadow|rounded|from|to|via)-/.test(part) ||
            /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space)-/.test(part) ||
            /^(w|h|min-w|min-h|max-w|max-h)-/.test(part) ||
            /^(font|tracking|leading|uppercase|lowercase|capitalize)$/.test(part) ||
            /^(hover|focus|active|disabled|sm|md|lg|xl|2xl):/.test(part) ||
            /^[-]?[a-z]+-\[/.test(part)
        );
    }).length;

    return classLikeCount >= Math.max(2, Math.ceil(parts.length * 0.5));
}

function isProbablyCodeOrConfig(value) {
    const text = normalizeText(value);
    if (!text) return true;
    if (text.length < 2 || text.length > 220) return true;
    if (!hasHumanLetter(text)) return true;

    if (/^https?:\/\//i.test(text)) return true;
    if (/^\/[^\s]+/.test(text)) return true;
    if (/^\.\.?\//.test(text)) return true;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text)) return true;
    if (/^rgb\(/i.test(text) || /^rgba\(/i.test(text)) return true;
    if (/^[A-Z_][A-Z0-9_]+$/.test(text)) return true;
    if (/^[a-zA-Z_$][\w$]*$/.test(text) && text.length < 4) return true;

    if (/\.(png|jpg|jpeg|webp|svg|css|json|jsx|js|ts|tsx|pdf|docx|xlsx)$/i.test(text)) return true;
    if (/^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)$/i.test(text)) return true;
    if (/^(Content-Type|Authorization|Bearer|application\/json|multipart\/form-data)$/i.test(text)) return true;
    if (/^(true|false|null|undefined)$/i.test(text)) return true;
    if (/^(id|en)$/i.test(text)) return true;
    if (/^VITE_/i.test(text)) return true;

    if (text.includes("${")) return true;
    if (text.includes("=>")) return true;
    if (text.includes("import ") || text.includes("export ")) return true;
    if (text.includes("className=")) return true;

    const slashCount = (text.match(/\//g) || []).length;
    if (slashCount >= 2) return true;

    if (isLikelyTailwindClass(text)) return true;

    return false;
}

function addCandidate(map, rawText, filePath, line, sourceType) {
    const text = normalizeText(rawText);
    if (isProbablyCodeOrConfig(text)) return;

    if (!map.has(text)) {
        map.set(text, {
            text,
            count: 0,
            sources: [],
        });
    }

    const entry = map.get(text);
    entry.count += 1;

    const relativeFile = path.relative(ROOT_DIR, filePath).replaceAll(path.sep, "/");
    const sourceKey = `${relativeFile}:${line}:${sourceType}`;

    if (!entry.sources.some((source) => source.key === sourceKey)) {
        entry.sources.push({
            key: sourceKey,
            file: relativeFile,
            line,
            sourceType,
        });
    }
}

function extractQuotedStrings(source, filePath, map) {
    const regex = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    let match;

    while ((match = regex.exec(source)) !== null) {
        const quote = match[1];
        const content = match[2];

        if (!content) continue;
        if (quote === "`" && content.includes("${")) continue;

        const line = lineNumberFromIndex(source, match.index);
        addCandidate(map, content, filePath, line, "string");
    }
}

function extractJsxText(source, filePath, map) {
    const regex = />\s*([^<>{}\n][^<>{}]*)\s*</g;
    let match;

    while ((match = regex.exec(source)) !== null) {
        const content = match[1];
        const line = lineNumberFromIndex(source, match.index);
        addCandidate(map, content, filePath, line, "jsx-text");
    }
}

function main() {
    if (!fileExists(SRC_DIR)) {
        console.error(`Folder src tidak ditemukan: ${SRC_DIR}`);
        process.exit(1);
    }

    const files = walkDirectory(SRC_DIR);
    const candidates = new Map();

    for (const filePath of files) {
        const source = fs.readFileSync(filePath, "utf8");
        extractQuotedStrings(source, filePath, candidates);
        extractJsxText(source, filePath, candidates);
    }

    const entries = Array.from(candidates.values())
        .map((entry) => ({
            ...entry,
            sources: entry.sources.slice(0, 20).map(({ key, ...source }) => source),
        }))
        .sort((a, b) => a.text.localeCompare(b.text, "id"));

    const payload = {
        generatedAt: new Date().toISOString(),
        projectRoot: ROOT_DIR,
        scannedFolder: SRC_DIR,
        scannedFiles: files.length,
        totalTexts: entries.length,
        texts: entries,
    };

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), "utf8");

    const txt = entries
        .map((entry, index) => {
            const firstSource = entry.sources[0];
            const location = firstSource ? `${firstSource.file}:${firstSource.line}` : "-";
            return `${String(index + 1).padStart(4, "0")}. ${entry.text}\n     count: ${entry.count}\n     first: ${location}`;
        })
        .join("\n\n");

    fs.writeFileSync(OUTPUT_TXT, txt, "utf8");

    const template = [
        "// Copy pasangan key ini ke ID_TO_EN di src/i18n/localUiTranslator.js",
        "// Value English masih perlu direview/diterjemahkan.",
        "",
        "const NEW_ID_TO_EN = {",
        ...entries.map((entry) => `  ${JSON.stringify(entry.text)}: "",`),
        "};",
        "",
    ].join("\n");

    fs.writeFileSync(OUTPUT_TEMPLATE, template, "utf8");

    console.log("Selesai scan UI text.");
    console.log(`Scanned files : ${files.length}`);
    console.log(`Total texts   : ${entries.length}`);
    console.log(`Output JSON   : ${path.relative(ROOT_DIR, OUTPUT_JSON)}`);
    console.log(`Output TXT    : ${path.relative(ROOT_DIR, OUTPUT_TXT)}`);
    console.log(`Template JS   : ${path.relative(ROOT_DIR, OUTPUT_TEMPLATE)}`);
}

main();
