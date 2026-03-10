const fs = require('fs');
const content = fs.readFileSync('cf_run.txt', 'utf16le');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Your quick Tunnel has been created')) {
        for (let j = 1; j < 10; j++) {
            console.log(lines[i + j]);
        }
    }
}
