const fs = require('fs');
const content = fs.readFileSync('cf_run.txt', 'utf16le');
const match = content.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
if (match) {
    console.log(match[0]);
} else {
    // try utf8 just in case
    const contentUtf8 = fs.readFileSync('cf_run.txt', 'utf8');
    const matchUtf8 = contentUtf8.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (matchUtf8) {
        console.log(matchUtf8[0]);
    } else {
        console.log('URL not found');
    }
}
