#!/usr/bin/env node

const StreamZip = require('node-stream-zip');
const fs = require('fs');
var path = require('path');

const checkFile = (filename) => {
    let ext = path.extname(filename)
    if (ext == '.epub' || ext == '.mobi') {
        return true
    }
}

const convertFile = (filename) => {
    let zip = new StreamZip({
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
            img.name = img.name.split('/')
            img.name[0] = '..'
            img.name = img.name.join('/')
            db = db.split(`${img.name}`).join(`data:image/png;base64, ${img.source}`)
        })
        const file = filename.split('.').slice(0, -1).join('.')
        fs.writeFileSync(`${file}.html`, (db))
        zip.close(() => console.log(filename + ' converted successfully.'))
    });
}

if (process.argv.length < 3) {
        console.log('Usage: node ' + process.argv[1] + ' FILENAME');
        process.exit(1);
    }

filename = process.argv[2];

if(filename === '*') {
    fs.readdir(process.cwd(), (err, files) => {
        files.forEach(filename => {
            if (checkFile(filename)) {
                convertFile(filename)
            }
        })
    })
} else {
    if (checkFile(filename)) {
        convertFile(filename)
    } else {
        console.log('This file is not an epub or mobi.')
    }
}