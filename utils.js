import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getUploadDirectory(username) {
  return `${__dirname}/uploads/${username}/`;
}

export function getUploadPath(username, filename) {
  return getUploadDirectory(username) + filename;
}

export function createDirectory(path) {
  !fs.existsSync(path) && fs.mkdirSync(path);
}
