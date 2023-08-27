const fs = require('fs').promises;
import path from 'path';
import yargs from 'yargs';
import StreamZip from 'node-stream-zip';
import convertFile from './convert';

const checkFile = (filename: string) => {
    let ext = path.extname(filename);
    return (ext == '.epub' || ext == '.mobi');
}

async function main() {
    try {
        const argv = yargs
            .usage('Usage: $0 [options] FILENAME')
            .option('all', {
                alias: 'a',
                describe: 'Convert all supported files in the current directory',
            })
            .help()
            .parseSync();

        const filename = argv._[0] as string;

        if (argv['all']) {
            const files = await fs.readdir(process.cwd());
            for (const file of files) {
                if (checkFile(file)) {
                    await convertAndSave(file);
                }
            }
        } else {
            if (checkFile(filename)) {
                await convertAndSave(filename);
            } else {
                console.log('This file is not an epub or mobi.');
            }
        }
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
}

async function convertAndSave(filename: string) {
    try {
        const zip = new StreamZip({
            file: filename,
            storeEntries: true,
        });

        zip.on('ready', async () => {
            const entryData = Object.values(zip.entries());
            const db = await convertFile(zip, entryData);

            const outputFilename = `${path.basename(filename, path.extname(filename))}.html`;
            await fs.writeFile(outputFilename, db, 'utf8');

            zip.close(() => console.log(`${filename} converted successfully.`));
        });
    } catch (error: any) {
        console.error(`Error converting ${filename}: ${error.message}`);
    }
}

export default main;