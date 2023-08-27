import { parse } from 'node-html-parser';
import path from 'path';
import StreamZip from 'node-stream-zip';

interface Chapter {
    name: string,
    text: string
}

interface Image {
    name: string,
    source: string
}

async function convertFile(zip: StreamZip, entryData: any): Promise<string> {
    const chps: Chapter[] = [];
    const imgs: Image[] = [];

    for (const entry of entryData) {
        if (path.basename(entry.name) === 'content.opf') {
            const ncx = parse(zip.entryDataSync(entry.name).toString('utf8'));
            const manifest = ncx.querySelector('manifest');
            if(manifest) {
                const items = manifest.querySelectorAll('item');
                if (items.length) {
                    for (const item of items) {
                        const itemName = item.getAttribute('href') || 'chapter';
                        const ext = itemName ? path.extname(itemName) : '';
        
                        if (ext === '.html' || ext === '.xhtml' || ext === '.htm') {
                            for (const entryName of Object.keys(zip.entries())) {
                                if (path.basename(entryName) === path.basename(itemName)) {
                                    const entry = zip.entry(entryName);
                                    if (entry) {
                                        const text = zip.entryDataSync(entryName).toString('utf8');
                                        chps.push({ name: itemName, text });
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }

        const ext = path.extname(entry.name);
        if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
            const image = zip.entryDataSync(entry.name).toString('base64');
            imgs.push({ name: path.basename(entry.name), source: image });
        }
    }

    chps.sort((a, b) => (a.name > b.name ? 1 : -1));
    let db = '';

    for (const chapter of chps) {
        const parsed = parse(chapter.text);
        replaceImageSources(parsed, imgs);
        db += parsed.toString();
    }

    return db;
}

function replaceImageSources(parsed: any, imgs: Image[]) {
    parsed.querySelectorAll('img').forEach((img: HTMLImageElement) => {
        const src = img.getAttribute('src');
        if(src) {
            const imageFile = imgs.find((img) => img.name === path.basename(src));
            if (imageFile) {
                img.setAttribute('src', `data:image/png;base64, ${imageFile.source}`);
            }
        }
    });

    parsed.querySelectorAll('image').forEach((image: HTMLImageElement) => {
        const src = image.getAttribute('xlink:href');
        if(src) {
            const imageFile = imgs.find((img) => img.name === path.basename(src));
            if (imageFile) {
                image.setAttribute('xlink:href', `data:image/png;base64, ${imageFile.source}`);
            }
        }
    });
}

export default convertFile;