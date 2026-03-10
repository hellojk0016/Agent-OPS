const fs = require('fs');
const content = fs.readFileSync('cf_run.txt', 'utf16le');
const lines = content.split('\n');
for (const line of lines) {
    if (line.includes('trycloudflare.com')) {
        console.log(line.trim());
    }
}
