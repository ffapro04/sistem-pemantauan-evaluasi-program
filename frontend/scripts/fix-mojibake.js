/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve(process.cwd(), "src");

const TARGET_EXTENSIONS = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".css",
    ".scss",
    ".html",
    ".json",
]);

const SKIP_DIRS = new Set([
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vite",
]);

const replacements = [
    // Dash / tanda pisah
    ["â€”", "-"],
    ["â€“", "-"],
    ["âˆ’", "-"],

    // Kutip
    ["â€˜", "'"],
    ["â€™", "'"],
    ["â€œ", '"'],
    ["â€", '"'],
    ["â€", '"'],

    // Ellipsis
    ["â€¦", "..."],

    // Bullet
    ["â€-", "-"],

    // Simbol umum
    ["âœ“", "✓"],
    ["âœ”", "✓"],
    ["âœ•", "×"],
    ["âœ–", "×"],

    // Spasi rusak
    ["Â ", " "],
    ["Â", ""],

    // Karakter tersembunyi / zero-width
    ["â€‹", ""],
    ["\u200B", ""],
    ["\u00A0", " "],
];

const suspiciousPatterns = [
    "â€",
    "â€”",
    "â€“",
    "â€™",
    "â€œ",
    "â€¦",
    "Â",
];

let changedFiles = 0;
let scannedFiles = 0;
const remainingSuspiciousFiles = [];

function shouldProcessFile(filePath) {
    return TARGET_EXTENSIONS.has(path.extname(filePath));
}

function walk(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`Folder tidak ditemukan: ${dir}`);
        process.exit(1);
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) {
                walk(fullPath);
            }
            continue;
        }

        if (!entry.isFile() || !shouldProcessFile(fullPath)) {
            continue;
        }

        scannedFiles += 1;

        const before = fs.readFileSync(fullPath, "utf8");
        let after = before;

        for (const [from, to] of replacements) {
            after = after.split(from).join(to);
        }

        if (after !== before) {
            fs.writeFileSync(fullPath, after, "utf8");
            changedFiles += 1;
            console.log(`FIXED: ${path.relative(process.cwd(), fullPath)}`);
        }

        if (suspiciousPatterns.some((pattern) => after.includes(pattern))) {
            remainingSuspiciousFiles.push(path.relative(process.cwd(), fullPath));
        }
    }
}

walk(ROOT_DIR);

console.log("");
console.log("Selesai.");
console.log(`File dicek   : ${scannedFiles}`);
console.log(`File diubah  : ${changedFiles}`);

if (remainingSuspiciousFiles.length > 0) {
    console.log("");
    console.log("Masih ada karakter mencurigakan di file berikut:");
    remainingSuspiciousFiles.forEach((file) => console.log(`- ${file}`));
    console.log("");
    console.log("Cek manual pakai Ctrl+F: â€ atau Â");
}