# epub-to-html

Simple Node package to convert epub/mobi files to html format. It will simply open the file, get all the chapters, sort them by their numbers, convert images to base64 and replace their paths. Pretty buggy as you can guess but it does the job.

~~It's almost 2022,~~ We are in the middle of 2023, and there is still no one good e-book reader for Windows. Yep.

  

# Usage

    npm install
    
    npm -g epub-to-html
    
    epub-to-html file.epub

  

Or you can add all epub or mobi files in the directory:

    epub-to-html --all
