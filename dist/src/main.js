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
const fs = require('fs').promises;
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const node_stream_zip_1 = __importDefault(require("node-stream-zip"));
const convert_1 = __importDefault(require("./convert"));
const checkFile = (filename) => {
    let ext = path_1.default.extname(filename);
    return (ext == '.epub' || ext == '.mobi');
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const argv = yargs_1.default
                .usage('Usage: $0 [options] FILENAME')
                .option('all', {
                alias: 'a',
                describe: 'Convert all supported files in the current directory',
            })
                .help()
                .parseSync();
            const filename = argv._[0];
            if (argv['all']) {
                const files = yield fs.readdir(process.cwd());
                for (const file of files) {
                    if (checkFile(file)) {
                        yield convertAndSave(file);
                    }
                }
            }
            else {
                if (checkFile(filename)) {
                    yield convertAndSave(filename);
                }
                else {
                    console.log('This file is not an epub or mobi.');
                }
            }
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
        }
    });
}
function convertAndSave(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const zip = new node_stream_zip_1.default({
                file: filename,
                storeEntries: true,
            });
            zip.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                const entryData = Object.values(zip.entries());
                const db = yield (0, convert_1.default)(zip, entryData);
                const outputFilename = `${path_1.default.basename(filename, path_1.default.extname(filename))}.html`;
                yield fs.writeFile(outputFilename, db, 'utf8');
                zip.close(() => console.log(`${filename} converted successfully.`));
            }));
        }
        catch (error) {
            console.error(`Error converting ${filename}: ${error.message}`);
        }
    });
}
exports.default = main;
