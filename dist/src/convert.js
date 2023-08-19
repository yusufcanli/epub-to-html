"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const path_1 = __importDefault(require("path"));
function convertFile(zip, entryData) {
    return __awaiter(this, void 0, void 0, function* () {
        const chps = [];
        const imgs = [];
        for (const entry of entryData) {
            if (entry.name === 'content.opf') {
                const ncx = (0, node_html_parser_1.parse)(zip.entryDataSync(entry.name).toString('utf8'));
                const manifest = ncx.querySelector('manifest');
                if (manifest) {
                    const items = manifest.querySelectorAll('item');
                    if (items.length) {
                        for (const item of items) {
                            const itemName = item.getAttribute('href') || 'chapter';
                            const ext = itemName ? path_1.default.extname(itemName) : '';
                            if (ext === '.html' || ext === '.xhtml' || ext === '.htm') {
                                const text = zip.entryDataSync(itemName).toString('utf8');
                                chps.push({ name: itemName, text });
                            }
                        }
                    }
                }
            }
            const ext = path_1.default.extname(entry.name);
            if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
                const image = zip.entryDataSync(entry.name).toString('base64');
                imgs.push({ name: path_1.default.basename(entry.name), source: image });
            }
        }
        chps.sort((a, b) => (a.name > b.name ? 1 : -1));
        let db = '';
        for (const chapter of chps) {
            const parsed = (0, node_html_parser_1.parse)(chapter.text);
            replaceImageSources(parsed, imgs);
            db += parsed.toString();
        }
        return db;
    });
}
function replaceImageSources(parsed, imgs) {
    parsed.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src) {
            const imageFile = imgs.find((img) => img.name === path_1.default.basename(src));
            if (imageFile) {
                img.setAttribute('src', `data:image/png;base64, ${imageFile.source}`);
            }
        }
    });
    parsed.querySelectorAll('image').forEach((image) => {
        const src = image.getAttribute('xlink:href');
        if (src) {
            const imageFile = imgs.find((img) => img.name === path_1.default.basename(src));
            if (imageFile) {
                image.setAttribute('xlink:href', `data:image/png;base64, ${imageFile.source}`);
            }
        }
    });
}
exports.default = convertFile;
