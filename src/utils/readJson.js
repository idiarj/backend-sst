import fs from 'fs';

export const readJson = (filePath) => {
    console.log(`Reading JSON file from: ${filePath}`);
    return JSON.parse(fs.readFileSync(new URL(filePath, import.meta.url), 'utf-8'));
}