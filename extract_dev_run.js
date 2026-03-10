const fs = require('fs');
const content = fs.readFileSync('cf_dev_run.txt', 'utf8');
const lines = content.replace(/\r/g, '').split('\n');
let fullText = content.replace(/\r/g, '').replace(/\n/g, '');
let match = fullText.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
if (match) {
    console.log('URL_FOUND:', match[0]);
} else {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Visit it at')) {
            let combined = lines[i + 1].trim() + lines[i + 2].trim() + lines[i + 3].trim();
            let subMatch = combined.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (subMatch) console.log('URL_FOUND:', subMatch[0]);
            break;
        }
    }
}
