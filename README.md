
# epub-to-html
Simple Node.js package to convert epub files to html format. It uses [node-stream-zip](https://www.npmjs.com/package/node-stream-zip) library. It will simply open the file, get all the chapters, sort them by their numbers, convert images to base64 and replace their paths. Pretty buggy as you can guess but it does the job.

It's almost 2022. And there is still no one good e-book reader for Windows. Yep.

# Usage

    npm install
    npm -g epub-to-html
    epub-to-html file.epub

 
 Or you can add all epub or mobi files:

     epub-to-html *
