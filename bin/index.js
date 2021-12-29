#!/usr/bin/env node

const StreamZip = require('node-stream-zip');
const fs = require('fs');
var path = require('path');

if (process.argv.length < 3) {
        console.log('Usage: node ' + process.argv[1] + ' FILENAME');
        process.exit(1);
    }
filename = process.argv[2];
    const zip = new StreamZip({
        file: filename,
        storeEntries: true
    });
    
    zip.on('ready', () => {
        var chps = [];
        var imgs = [];
        for (const entry of Object.values(zip.entries())) {
            let ext = path.extname(entry.name)
            if (ext == '.html' || ext == '.xhtml' || ext == '.htm') {
                let text = zip.entryDataSync(entry.name).toString('utf8');
                chps.push({name:entry.name, text: text})
            }
            if (ext == '.jpg' || ext == '.png' || ext == '.jpeg') {
                let image = zip.entryDataSync(entry.name).toString('base64');
                imgs.push({name:entry.name, source:image})
            }
        }
        chps.sort((a, b) => a.name > b.name ? 1 : -1);
        var db = ''
        chps.map(x => {
            db += x.text
        })
        imgs.map(img => {
            db = db.split(`${img.name}`).join(`data:image/png;base64, ${img.source}`)
        })
        const file = filename.split('.').slice(0, -1).join('.')
        fs.writeFileSync(`${file}.html`, (db))
		console.log("File created successfully");
        zip.close()
    });
  